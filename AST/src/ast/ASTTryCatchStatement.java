package ast;

import java.util.ArrayList;

/**
 * @author SOON WEI JUN A0156192A
 * this class is mainly in charge of construction
 * AST nodes that represents a try catch in programs
 *
 */
public class ASTTryCatchStatement extends ASTBlockStatement {
	private static final String NODE_TYPE = "Try Catch Statement";
	protected ArrayList<ASTStatement> tryBlock;
	protected ArrayList<ArrayList<ASTExpressionUnitIdentifier>> catchExceptions;
	protected ArrayList<ArrayList<ASTStatement>> catchBlocks;
	protected ArrayList<ASTStatement> finallyBlock;
	protected ArrayList<ASTExpressionUnitIdentifier> ex;
	protected int numCatchBlocks;

	public ASTTryCatchStatement() {
		super();
		this.tryBlock = new ArrayList<ASTStatement>();
		this.catchExceptions = new ArrayList<ArrayList<ASTExpressionUnitIdentifier>>();
		this.catchBlocks = new ArrayList<ArrayList<ASTStatement>>();
		this.finallyBlock = new ArrayList<ASTStatement>();
		this.ex = new ArrayList<ASTExpressionUnitIdentifier>();
		this.numCatchBlocks = -1;
	}
	
	public void addTryBlock(ASTStatement s) {
		this.tryBlock.add(s);
		s.addParent(this);
	}
	
	public void addCatchBlock() {
		this.catchBlocks.add(new ArrayList<ASTStatement>());
		this.catchExceptions.add(new ArrayList<ASTExpressionUnitIdentifier>());
		this.ex.add(new ASTExpressionUnitIdentifier(""));
		this.numCatchBlocks++;
	}
	
	public void addCatchExceptions(ASTExpressionUnitIdentifier ex) {
		this.catchExceptions.get(this.numCatchBlocks).add(ex);
		ex.addParent(this);
	}
	
	public void setEx(ASTExpressionUnitIdentifier ex) {
		this.ex.set(this.numCatchBlocks, ex);
		ex.addParent(this);
	}
	
	public void addCatchBlocks(ASTStatement s) {
		this.catchBlocks.get(this.numCatchBlocks).add(s);
		s.addParent(this);
	}
	
	public void addFinallyBlock(ASTStatement s) {
		this.finallyBlock.add(s);
		s.addParent(this);
	}
	
	// virtual method
	public String toSyntax() {
		this.result = "\n";
		return this.result;
	}

	public String typeof() {
		return super.typeof() + "->" + NODE_TYPE;
	}

	public String toTree(int indent) {
		StringBuilder sb = new StringBuilder("");
		for (int i = 0; i < indent; i++) {
			sb.append("\t");
		}
		sb.append(this.typeof());
		sb.append("\n");
		for (ASTStatement s : this.tryBlock) {
			sb.append(s.toTree(indent + 1));
			sb.append("\n");
		}
		for (int j = 0; j <= this.numCatchBlocks; j++) {
			for (int k = 0; k < indent; k++) {
				sb.append("\t");
			}
			sb.append("catch_block");
			sb.append("\n");
			for (ASTStatement s : this.catchBlocks.get(j)) {
				sb.append(s.toTree(indent + 1));
				sb.append("\n");
			}

		}
		for(int i = 0;i<indent;i++){
			sb.append("\t");
		}
		sb.append("finally_block");
		sb.append("\n");
		for(ASTStatement s:this.finallyBlock){
			sb.append(s.toTree(indent+1));
			sb.append("\n");
		}
		return sb.toString();
	}
}
