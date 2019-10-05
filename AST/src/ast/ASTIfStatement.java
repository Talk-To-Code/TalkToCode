package ast;
import java.util.*;
/**
 * @author GAO RISHENG A0101891L
 * This class is mainly in charge of AST Node generation of if statement in C/JAVA/Python Programs
 */
public class ASTIfStatement extends ASTBlockStatement {
	private static final String NODE_TYPE = "If Statement";
	protected ASTExpression condition;
	protected ArrayList<ASTStatement> ifBranch;
	protected ArrayList<ASTStatement> elseBranch;
	protected String result;
	private void initialize() {
		this.ifBranch =  new ArrayList<ASTStatement>();
		this.elseBranch = new ArrayList<ASTStatement>();
	}
	public ASTIfStatement() {
		super();
		initialize();
	}
	public ASTIfStatement(ASTExpression e){
		super();
		this.condition = e;
		initialize();
		e.addParent(this);
	}

	public void setIf(ASTStatement e){
		this.ifBranch.add(e);
		e.addParent(this);
	}
	public void setElse(ASTStatement e){
		this.elseBranch.add(e);
		e.addParent(this);
	}
	public String typeof() {
		return super.typeof()+"->"+NODE_TYPE;
	}
	public String toSyntax() {

		return this.result;
	}
	public String toTree(int indent){
		StringBuilder sb = new StringBuilder("");
		for(int i = 0;i<indent;i++){
			sb.append("\t");
		}
		sb.append(this.typeof());
		sb.append("\n");
		for(ASTStatement s:this.ifBranch){
			sb.append(s.toTree(indent+1));
			sb.append("\n");
		}
		for(int i = 0;i<indent;i++){
			sb.append("\t");
		}
		sb.append("else_branch");
		sb.append("\n");
		for(ASTStatement s:this.elseBranch){
			sb.append(s.toTree(indent+1));
			sb.append("\n");
		}
		return sb.toString();
	}
}
