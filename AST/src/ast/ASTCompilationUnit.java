package ast;
import java.util.ArrayList;
/**
 * @author GAO RISHENG A0101891L
 * This class is mainly construct the ASTNode for a program
 *
 */
public class ASTCompilationUnit extends ASTNode {
	private static final String NODE_TYPE = "Compilation Unit";
	protected ArrayList<ASTStatement> statements;
	//program name
	protected String name;
	public ASTCompilationUnit(String name) {
		this.isBlock = true;
		this.statements = new ArrayList<ASTStatement>();
		this.name = name;
	}
	public void addStatement(ASTStatement s){
		this.statements.add(s);
		s.addParent(this);
	}
	//virtual method
	public String toSyntax(){
		this.result = "";
		for(ASTStatement s:this.statements){
			this.result += s.toSyntax() +"\n";
		}
		return this.result;
	}
	public String typeof() {
		return super.typeof()+"->"+NODE_TYPE;
	}
	public String toTree(int indent){
		StringBuilder sb = new StringBuilder("");
		for(int i = 0;i<indent;i++){
			sb.append("\t");
		}
		sb.append(this.typeof());
		sb.append("\n");
		for(ASTStatement s:this.statements){
			sb.append(s.toTree(indent+1));
			sb.append("\n");
		}
		return sb.toString();
	}
}
